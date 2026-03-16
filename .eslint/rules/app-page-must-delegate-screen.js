const ALLOWED_INLINE_PAGES = new Set(['src/app/dev/auth-admin/page.tsx'])

function normalizeFilename(filename) {
  return filename.replace(/\\/g, '/')
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'keep App Router page entrypoints thin and delegated to feature screens',
    },
    schema: [],
    messages: {
      useClient:
        'Route entrypoints in src/app should stay server-side and thin. Move client logic into a feature screen.',
      missingScreenImport:
        'Route entrypoints in src/app must delegate to a screen in src/features/.../screens.',
    },
  },
  create(context) {
    const filename = normalizeFilename(context.getFilename())
    const appPageMatch = /(^|\/)src\/app\/.*\/page\.tsx$|(^|\/)src\/app\/page\.tsx$/.test(filename)

    if (!appPageMatch || ALLOWED_INLINE_PAGES.has(filename.slice(filename.indexOf('src/')))) {
      return {}
    }

    let hasFeatureScreenImport = false

    return {
      ImportDeclaration(node) {
        if (/^@\/features\/.+\/screens\/.+/.test(node.source.value)) {
          hasFeatureScreenImport = true
        }
      },
      Program(node) {
        for (const statement of node.body) {
          if (
            statement.type === 'ExpressionStatement' &&
            statement.directive === 'use client'
          ) {
            context.report({ node: statement, messageId: 'useClient' })
          }
        }
      },
      'Program:exit'(node) {
        if (!hasFeatureScreenImport) {
          context.report({ node, messageId: 'missingScreenImport' })
        }
      },
    }
  },
}
