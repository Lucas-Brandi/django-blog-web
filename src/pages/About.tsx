/** Página "Sobre" do blog. */
export default function About() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">
        Sobre
      </p>
      <h1 className="text-3xl font-bold">Sobre o Django Blog</h1>
      <p className="text-muted-foreground">
        Um lugar simples para escrever e compartilhar textos. Este é o front-end
        em React que consome a API do blog.
      </p>
    </div>
  );
}
