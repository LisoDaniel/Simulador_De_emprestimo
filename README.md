<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/11-x-prO8xoz9KFUlwAVgsZRROK1KTugp

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Persistência das configurações na Vercel

As taxas e a margem são salvas em um arquivo privado do Vercel Blob, por meio da função `api/settings.ts`. Isso faz com que a configuração seja compartilhada entre navegadores e dispositivos, sem usar um banco de dados SQL.

1. Na aba **Storage** do projeto na Vercel, crie um Blob store e conecte-o ao projeto nos ambientes usados pelo deploy.
2. Em **Project Settings > Environment Variables**, crie `CONFIG_UPDATE_TOKEN` com um valor secreto forte.
3. Faça um novo deploy.
4. Abra **Configurações** no aplicativo, informe o mesmo token, ajuste as taxas e clique em **Salvar Alterações**.

O token é usado somente para gravar alterações; a leitura da configuração salva fica disponível para todos os navegadores que acessarem o aplicativo.
