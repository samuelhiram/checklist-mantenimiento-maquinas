function isFormElement(node) {
  return node.openingElement && node.openingElement.name && node.openingElement.name.name === 'form'
}

function isFormSubmitButton(node) {
  return (
    node.type === 'JSXElement' &&
    node.openingElement &&
    node.openingElement.name &&
    node.openingElement.name.name === 'FormSubmitButton'
  )
}

function containsFormSubmitButton(children) {
  for (const child of children) {
    if (isFormSubmitButton(child)) {
      return true
    }

    if (child.type === 'JSXElement' && containsFormSubmitButton(child.children || [])) {
      return true
    }
  }

  return false
}

function hasServerActionProp(node) {
  const actionAttribute = node.openingElement.attributes.find(
    attribute => attribute.type === 'JSXAttribute' && attribute.name && attribute.name.name === 'action'
  )

  if (!actionAttribute || !actionAttribute.value || actionAttribute.value.type !== 'JSXExpressionContainer') {
    return false
  }

  const expression = actionAttribute.value.expression

  return expression.type === 'Identifier' || expression.type === 'MemberExpression'
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'require FormSubmitButton in forms backed by server actions',
    },
    schema: [],
    messages: {
      useFormSubmitButton:
        'Forms with server actions must use FormSubmitButton to preserve the shared pending/loading UX.',
    },
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/')

    if (!filename.includes('/src/')) {
      return {}
    }

    return {
      JSXElement(node) {
        if (!isFormElement(node) || !hasServerActionProp(node)) {
          return
        }

        if (!containsFormSubmitButton(node.children || [])) {
          context.report({ node: node.openingElement, messageId: 'useFormSubmitButton' })
        }
      },
    }
  },
}
