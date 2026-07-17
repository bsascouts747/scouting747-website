export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'heroImage',
      title: 'Homepage Hero Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'heroImageAlt',
      title: 'Alt text',
      type: 'string',
    },
  ],
};