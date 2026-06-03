export interface HalHome {
  status: string;
  _links: {
    self: { href: string };
    status: { href: string };
  };
}
