// Locator definitions come in two shapes: a CSS string, or a { role, name }
// descriptor. Role-based lookup goes through the accessibility tree, so it
// survives markup churn better than a CSS path does.
function resolveLocator(page, descriptor) {
  if (typeof descriptor === 'string') {
    return page.locator(descriptor);
  }
  if (descriptor && descriptor.role) {
    return page.getByRole(descriptor.role, { name: descriptor.name, exact: descriptor.exact });
  }
  throw new Error(`Tanımsız locator: ${JSON.stringify(descriptor)}`);
}

module.exports = { resolveLocator };
