import { get, put } from '@vercel/blob';
import type { AppSettings } from '../types';

const SETTINGS_PATH = 'carlinapp/settings.json';

const isAppSettings = (value: unknown): value is AppSettings => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as { rates?: unknown; profitMargin?: unknown };
  const profitMargin = Number(candidate.profitMargin);

  if (!Number.isFinite(profitMargin) || profitMargin < 0 || profitMargin >= 1000) {
    return false;
  }

  if (!Array.isArray(candidate.rates) || candidate.rates.length !== 18) {
    return false;
  }

  const installmentNumbers = new Set<number>();

  for (const rate of candidate.rates) {
    if (!rate || typeof rate !== 'object') {
      return false;
    }

    const candidateRate = rate as { parcelas?: unknown; taxa?: unknown };
    const parcelas = Number(candidateRate.parcelas);
    const taxa = Number(candidateRate.taxa);

    if (
      !Number.isInteger(parcelas) ||
      parcelas < 1 ||
      parcelas > 18 ||
      installmentNumbers.has(parcelas) ||
      !Number.isFinite(taxa) ||
      taxa < 0 ||
      taxa >= 100
    ) {
      return false;
    }

    installmentNumbers.add(parcelas);
  }

  return installmentNumbers.size === 18;
};

const readSettings = async (): Promise<AppSettings | null> => {
  const result = await get(SETTINGS_PATH, { access: 'private' });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return null;
  }

  const value = await new Response(result.stream).json();
  return isAppSettings(value) ? value : null;
};

export default {
  async fetch(request: Request) {
    if (request.method === 'GET') {
      try {
        const settings = await readSettings();
        return Response.json(settings, {
          headers: { 'Cache-Control': 'no-store' },
        });
      } catch (error) {
        console.error('Erro ao ler configurações da Vercel:', error);
        return Response.json(
          { error: 'Armazenamento remoto indisponível.' },
          { status: 503 },
        );
      }
    }

    if (request.method === 'PUT') {
      const expectedToken = process.env.CONFIG_UPDATE_TOKEN?.trim();

      if (!expectedToken) {
        return Response.json(
          { error: 'CONFIG_UPDATE_TOKEN não está configurado na Vercel.' },
          { status: 503 },
        );
      }

      if (request.headers.get('x-config-token') !== expectedToken) {
        return Response.json(
          { error: 'Token de atualização inválido.' },
          { status: 401 },
        );
      }

      try {
        const body = await request.json();

        if (!isAppSettings(body)) {
          return Response.json(
            { error: 'Configuração inválida.' },
            { status: 400 },
          );
        }

        await put(SETTINGS_PATH, JSON.stringify(body), {
          access: 'private',
          allowOverwrite: true,
          contentType: 'application/json',
          cacheControlMaxAge: 60,
        });

        return Response.json({ ok: true });
      } catch (error) {
        console.error('Erro ao salvar configurações na Vercel:', error);
        return Response.json(
          { error: 'Não foi possível salvar a configuração.' },
          { status: 500 },
        );
      }
    }

    return new Response('Método não permitido.', {
      status: 405,
      headers: { Allow: 'GET, PUT' },
    });
  },
};
