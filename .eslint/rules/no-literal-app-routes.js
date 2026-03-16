function isRouteLiteral(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
}

function isLiteralNode(node) {
  return node && (node.type === 'Literal' || node.type === 'StringLiteral')
}

function getAttributeStringValue(node) {
  if (!node.value) {
    return null
  }

  if (node.value.type === 'Literal') {
    return node.value.value
  }

  return null
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'force route helpers instead of inline app route strings',
    },
    schema: [],
    messages: {
      useRoutePaths:
        'Use ROUTE_PATHS helpers instead of inline route strings for navigation and route-aware helpers.',
    },
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/')

    if (
      !filename.includes('/src/') ||
      filename.endsWith('/src/features/navigation/routes.ts') ||
      filename.endsWith('/src/features/navigation/routes.tsx')
    ) {
      return {}
    }

    function reportIfRouteLiteral(node, value) {
      if (isRouteLiteral(value)) {
        context.report({ node, messageId: 'useRoutePaths' })
      }
    }

    return {
      JSXAttribute(node) {
        const attributeName = node.name && node.name.name
        if (attributeName !== 'href' && attributeName !== 'action') {
          return
        }

        reportIfRouteLiteral(node, getAttributeStringValue(node))
      },
      CallExpression(node) {
        const callee = node.callee
        const firstArg = node.arguments[0]

        if (!firstArg || !isLiteralNode(firstArg)) {
          return
        }

        if (callee.type === 'Identifier' && (callee.name === 'redirect' || callee.name === 'revalidatePath')) {
          reportIfRouteLiteral(firstArg, firstArg.value)
          return
        }

        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          ['push', 'replace', 'prefetch'].includes(callee.property.name)
        ) {
          reportIfRouteLiteral(firstArg, firstArg.value)
        }
      },
    }
  },
}
