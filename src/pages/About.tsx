import { Card, CardContent } from '@/components/ui/card';

/**
 * Página "Sobre" (M16). Página estática dentro do layout base: rótulo,
 * título e um cartão de texto.
 */
export default function About() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Sobre
        </p>
        <h1 className="text-3xl font-bold">Sobre o Django Blog</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 text-base leading-relaxed">
          <p>
            O Django Blog é um espaço simples para escrever e compartilhar
            textos. Qualquer pessoa pode ler os posts; com uma conta, você
            publica os seus, comenta e mantém um perfil com foto e bio.
          </p>
          <p className="text-muted-foreground">
            O projeto tem duas partes: uma API REST feita em Django, que guarda
            os posts, os comentários e os perfis, e este front-end em React,
            que consome essa API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
