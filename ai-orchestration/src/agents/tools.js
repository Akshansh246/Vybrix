import axios from "axios";
import { tool } from 'langchain'
import * as z from 'zod'


export const listFiles = tool(
    async () => {
        console.log('========================================')
        console.log('using the listFiles tool')
        console.log('========================================')

        const response = await axios.get('http://sandbox-service-019e9c2b-1e9f-7777-9ba3-58307b83f70a:3000/list-files')

        console.log('========================================')
        console.log('response from the listFiles tool', response.data.files)
        console.log('========================================')

        return JSON.stringify(response.data.files)
    },
    {
        name: "list_files",
        description: "Lists all the files in the project directory. This is useful for understanding what files are available to work with.",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files: [] }) => {
        console.log('========================================')
        console.log('using the readFiles tool', files)
        console.log('========================================')


        const response = await axios.get('http://sandbox-service-019e9c2b-1e9f-7777-9ba3-58307b83f70a:3000/read-files?files=' + files.join(','))

        console.log('========================================')
        console.log('response from the readFiles tool', response.data)
        console.log('========================================')

        return JSON.stringify(response.data)
    },
    {
        name: "read_files",
        description: "Read the contents of specified files. This is useful for understanding the content of files that are relevant to the task at hand.",
        schema: z.object({
            files: z.array(z.string()).describe('The list of files absolute paths to read. These should be files that were listed using the list_files tool or created later.')
        })
    }
)

export const updateFiles = tool(
    async ({ files }) => {
        console.log('========================================')
        console.log('using the updateFiles tool', files)
        console.log('========================================')


        const response = await axios.patch('http://sandbox-service-019e9c2b-1e9f-7777-9ba3-58307b83f70a:3000/update-files', {
            updates: files
        })

        console.log('========================================')
        console.log('response from the updateFiles tool', response.data.results)
        console.log('========================================')

        return JSON.stringify(response.data.results)
    },
    {
        name: "update_files",
        description: "Update the contents of a specified files. This is useful for making changes to files based on the requirements of the task at hand. Always make sure to read files before updating them to ensure you understand the existing content and structure.",
        schema: z.object({
            files: z.array(z.object({
                file: z.string().describe('The absolute path of the file to update'),
                content: z.string().describe('The new content for the file. The content should support json format.')
            })).describe("The list of the files to update and their new contents")
        })
    }
)

export const createFiles = tool(
    async ({ files }) => {

        console.log('========================================')
        console.log('using createFiles tool', files)
        console.log('========================================')

        const response = await axios.post(
            'http://sandbox-service-019e9c2b-1e9f-7777-9ba3-58307b83f70a:3000/create-files',
            { files }
        )

        return JSON.stringify(response.data.results)

    },
    {
        name: "create_files",
        description: `
            Create one or more new files.

            Use this tool whenever a file does not already exist.

            This tool can also create required folders automatically.

            Examples:
            - src/components/Hero.jsx
            - src/components/Navbar.jsx
            - src/pages/Home.jsx
            - src/styles/theme.css
        `,
        schema: z.object({
            files: z.array(
                z.object({
                    file: z.string(),
                    content: z.string()
                })
            )
        })
    }
)