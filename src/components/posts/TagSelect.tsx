import { useEffect, useState } from 'react';
import { ChevronsUpDown, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { listTags, type Tag } from '@/services/tags';

interface TagSelectProps {
  /** Tags selecionadas (nomes). */
  value: string[];
  onChange: (tags: string[]) => void;
  /** Associa o rótulo externo ao gatilho, para acessibilidade. */
  labelId?: string;
}

/** Normaliza um nome de tag: sem espaços nas pontas e em minúsculas. */
function normalize(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Seletor de tags com combobox (popover + command). Sugere as tags já
 * existentes na API (com contagem de posts) e permite criar novas digitando
 * um nome e confirmando. As selecionadas aparecem como badges removíveis.
 *
 * A API aceita nomes livres em `tag_input`, então criar uma tag inexistente é
 * só adicioná-la à lista; o backend cuida de persistir/associar.
 */
export function TagSelect({ value, onChange, labelId }: TagSelectProps) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState<Tag[]>([]);
  const [query, setQuery] = useState('');

  // Carrega as tags existentes uma vez, para sugerir no combobox.
  useEffect(() => {
    let active = true;
    listTags()
      .then((data) => {
        if (active) setAvailable(data.results);
      })
      .catch(() => {
        // Sem sugestões: o usuário ainda pode digitar tags livremente.
        if (active) setAvailable([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = new Set(value.map(normalize));

  function toggle(name: string) {
    const normalized = normalize(name);
    if (!normalized) return;
    if (selected.has(normalized)) {
      onChange(value.filter((t) => normalize(t) !== normalized));
    } else {
      onChange([...value, normalized]);
    }
  }

  function remove(name: string) {
    onChange(value.filter((t) => normalize(t) !== normalize(name)));
  }

  const trimmedQuery = normalize(query);
  const queryIsNew =
    trimmedQuery.length > 0 &&
    !available.some((tag) => normalize(tag.name) === trimmedQuery) &&
    !selected.has(trimmedQuery);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-labelledby={labelId}
              aria-expanded={open}
              className="w-full justify-between font-normal text-muted-foreground"
            />
          }
        >
          {value.length > 0
            ? `${value.length} tag(s) selecionada(s)`
            : 'Selecionar ou criar tags'}
          <ChevronsUpDown className="opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command
            // Filtra pelo nome da tag; a busca cobre tags existentes.
            filter={(itemValue, search) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput
              placeholder="Buscar ou criar tag…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                {trimmedQuery
                  ? 'Nenhuma tag encontrada.'
                  : 'Digite para buscar ou criar.'}
              </CommandEmpty>
              {queryIsNew && (
                <CommandGroup heading="Criar">
                  <CommandItem
                    value={`create-${trimmedQuery}`}
                    onSelect={() => {
                      toggle(trimmedQuery);
                      setQuery('');
                    }}
                  >
                    <Plus />
                    Criar tag “{trimmedQuery}”
                  </CommandItem>
                </CommandGroup>
              )}
              {available.length > 0 && (
                <CommandGroup heading="Tags existentes">
                  {available.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      data-checked={selected.has(normalize(tag.name))}
                      onSelect={() => toggle(tag.name)}
                    >
                      {tag.name}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {tag.post_count}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <li key={tag}>
              <Badge variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => remove(tag)}
                  aria-label={`Remover a tag ${tag}`}
                  className="inline-flex items-center rounded-full outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
