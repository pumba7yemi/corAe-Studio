import { modulesFor, CorAeLayer } from './modules-map';

export interface NavItem {
  label: string;
  href: string;
  core: boolean;
}

export interface CorAeNav {
  home: NavItem[];
  work: NavItem[];
  business: NavItem[];
}

function layerPath(layer: CorAeLayer, id: string): string {
  // id: "home.glam" → "glam"
  const slug = id.split('.')[1];
  return `/ship/${layer}/${slug}`;
}

export function buildNav(): CorAeNav {
  return {
    home: modulesFor('home').map(m => ({
      label: m.name,
      href: layerPath('home', m.id),
      core: m.core,
    })),
    work: modulesFor('work').map(m => ({
      label: m.name,
      href: layerPath('work', m.id),
      core: m.core,
    })),
    business: modulesFor('business').map(m => ({
      label: m.name,
      href: layerPath('business', m.id),
      core: m.core,
    })),
  };
}
