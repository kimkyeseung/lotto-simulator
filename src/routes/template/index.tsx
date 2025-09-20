import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/template/')({
  component: TemplateIndex,
})

function TemplateIndex() {
  return (
    <div className="p-2">
      <h3>Welcome to the template page!</h3>
    </div>
  )
}
