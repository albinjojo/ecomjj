function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special characters (apostrophes, &, etc.)
    .replace(/[\s_]+/g, '-')    // replace spaces/underscores with hyphens
    .replace(/-+/g, '-');       // collapse multiple hyphens into one
}

async function generateUniqueSlug(prisma, name) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let counter = 2;

  // Keep checking until we find a slug that doesn't already exist
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { slugify, generateUniqueSlug };