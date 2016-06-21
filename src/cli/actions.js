// Default callback for store functions
function storeCb(err) {
  if (err) {
    throw err;
  }
}

export function updateSection(sections, section) {
  sections.get(section.data.referenceURI, (err, data) => {
    if (data) {
      sections.set(
        section.data.referenceURI,
        Object.assign({}, data, section.data),
        storeCb
      );
    } else {
      sections.set(section.data.referenceURI, section.data, storeCb);
    }
  });
}
