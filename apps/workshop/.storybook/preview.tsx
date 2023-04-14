import type { Preview } from '@storybook/react'
import { Controls, Description, Primary, Stories, Subtitle, Title } from '@storybook/blocks'
import 'tailwindcss/tailwind.css'

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      page: () => (
        <>
          <Title/>
          <Subtitle/>
          <Description/>
          <Primary/>
          <Controls/>
          <Stories/>
        </>
      ),
    },
  },
}

export default preview
