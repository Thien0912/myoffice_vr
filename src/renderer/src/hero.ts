import { heroui } from '@heroui/react'

export default heroui({
    themes: {
        light: {

        },
        dark: {
            colors: {
                primary: {
                    DEFAULT: '#0053b3',
                    foreground: '#ffffff'
                }
            }
        },
    },
    layout: {
        radius: {
            small: "2px",
            medium: "4px",
            large: "6px"
        }
    }
})
