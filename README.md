# Her Space

Aplicação pessoal para hábitos, tese e evolução no ginásio, com React, Supabase e GitHub Pages.

## Ativar a base de dados

1. No Supabase, abra **SQL Editor**.
2. Copie e execute [supabase/schema.sql](supabase/schema.sql).
3. Em **Authentication → URL Configuration**, use como Site URL e Redirect URL:
   `https://joao-eleuterio.github.io/her-space/`

As políticas RLS garantem que cada conta acede apenas aos próprios dados.

## Desenvolvimento

```bash
npm install
npm run dev
```

Cada push para `main` publica automaticamente no GitHub Pages.
