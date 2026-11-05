import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LogOut, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { BRAND_NAME, NAV_LINKS } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/** Marca do blog com link para a página inicial. */
function Brand() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
        DB
      </span>
      {BRAND_NAME}
    </Link>
  );
}

/** Classe aplicada a um link de navegação conforme o estado ativo. */
function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-accent text-accent-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  );
}

/** Iniciais usadas no fallback do avatar. */
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

/** Menu de perfil do usuário autenticado (avatar + dropdown). */
function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Abrir menu do perfil"
          />
        }
      >
        <Avatar>
          {user.imageUrl && (
            <AvatarImage src={user.imageUrl} alt={user.username} />
          )}
          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/perfil" />}>
          <User />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Ações da direita quando o usuário está anônimo. */
function GuestActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" render={<Link to="/login" />}>
        Entrar
      </Button>
      <Button size="sm" render={<Link to="/registrar" />}>
        Criar conta
      </Button>
    </div>
  );
}

/** Menu mobile colapsável, com os links e as ações de conta. */
function MobileMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Abrir menu" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <SheetClose
              key={link.to}
              render={
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={navLinkClass}
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar size="sm">
                  {user.imageUrl && (
                    <AvatarImage src={user.imageUrl} alt={user.username} />
                  )}
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <SheetClose
                render={
                  <Button
                    variant="ghost"
                    className="justify-start"
                    render={<Link to="/perfil" />}
                  />
                }
              >
                <User />
                Meu perfil
              </SheetClose>
              <SheetClose
                render={
                  <Button
                    variant="destructive"
                    className="justify-start"
                    onClick={logout}
                  />
                }
              >
                <LogOut />
                Sair
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose
                render={
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link to="/login" />}
                  />
                }
              >
                Entrar
              </SheetClose>
              <SheetClose
                render={
                  <Button className="w-full" render={<Link to="/registrar" />} />
                }
              >
                Criar conta
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Navbar responsiva do blog. Em telas médias para cima mostra os links e as
 * ações inline; no mobile, colapsa num menu lateral (Sheet).
 */
export function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
        <Brand />

        {/* Navegação principal (desktop) */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={navLinkClass}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Ações de conta (desktop) */}
        <div className="hidden items-center md:flex">
          {isAuthenticated ? <UserMenu /> : <GuestActions />}
        </div>

        {/* Menu mobile */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
