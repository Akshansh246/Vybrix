import express from 'express'
import morgan from 'morgan'
import fs from 'fs'
import path from 'path'

const WORKING_DIR =  '/workspace'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.status(200).json({
        message:"Hello from sandbox agent",
        status: "success"
    })
})

/**
 * @route GET /list-file
 * @description Lists all the files in the working directory and its subdirectories. Returns a JSON Object with the file paths relative to the working directory, exclude directories from the list like node_modules, .git, dist etc
 */
app.get('/list-files', async (req, res) => {
    const listFiles = async (dir, baseDir) => {
        const entries = await fs.promises.readdir(dir, {withFileTypes: true})
        const files = []

        for(const entry of entries){
            const fullPath = path.join(dir, entry.name)
            const relativePath = path.relative(baseDir, fullPath)

            //excluding certain directories
            if(entry.isDirectory() && ['node_modules', '.git', 'dist'].includes(entry.name)){
                continue
            }

            if(entry.isDirectory()){
                files.push(...await listFiles(fullPath, baseDir))
            } else {
                files.push(relativePath)
            }
        }

        return files
    }

    try{
        const files = await listFiles(WORKING_DIR, WORKING_DIR)
        res.status(200).json({
            message: 'Files listed successfully',
            files,
        })
    }catch(err){
        res.status(500).json({
            message: `Error listing files ${err.message}`,
            status: 'error'
        })
    }
})

/**
 * @route GET /read-files
 * @description Reads all the content of the files requested in the query parameter 'files'  and return their content as JSON parameter
 * @query /read-files?files=file1.txt,/src/file2.txt
*/
app.get('/read-files',async (req, res) => {
    
    const files = req.query.files

    if(!files){
        return res.status(400).json({
            message: "No files specified in the query parameter",
            success: 'error'
        })
    }

    const fileList = files.split(',')

    const results = await Promise.all(fileList.map(async (file) => {
        const filePath = path.join(WORKING_DIR, file)
        try{
            const content = await fs.promises.readFile(filePath, 'utf-8')
            return {
                [filePath.replace(WORKING_DIR, '')] : content
            }
        }catch(err){
            return {
                [ filePath.replace(WORKING_DIR, '') ] : `Error reading file ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message: "File read results",
        results
    })
});

/**
 * @route PATCH /update-files
 * @description updates the content of files specified in the request body. The request body should contain a property "updates" with a JSON Array of object, each object should have a 'file' property specifing the file path (relative to the working directory) and a 'content' property specifying the new content for the file
 */
app.patch('/update-files', async (req, res) => {
    const updates = req.body.updates

    if(!updates || !Array.isArray(updates)){
        return res.status(400).json({
            message: "Invalid request body, Expected a JSON object with an 'updates' property containing an array of file updates",
            status: 'error'
        });
    }

    const results = await Promise.all(updates.map(async (update) => {
        const {file, content} = update
        const filePath = path.join(WORKING_DIR, file)

        try{
            await fs.promises.writeFile(filePath, content, 'utf-8')
            return {
                [ filePath ]: 'file updated successfully',
            }
        }catch(err){
            return {
                [ filePath ]: `Error updating the file: ${err.message}`
            }
        }

    }))

    res.status(200).json({
        message: "File update results",
        results
    })

});


/**
 * @route /create-files
 * @method POST
 * @description Creates new file with the content specified in the request body. The request body should contain a property 'files' with a JSON array of objects, each object should have a 'file' property specifying the file path (relative to the working directory) and a content property specifying the content for the new file
 */
app.post('/create-files',async (req, res) => {
    const files = req.body.files

    if(!files || !Array.isArray(files)){
        return res.status(400).json({
            message: "Invalid request body, Expected a JSON object with an 'files' property containing an array of file objects",
            status: 'error'
        });
    }

    const results = await Promise.all(files.map(async (fileObj) => {
        const {file, content} = fileObj
        const filePath = path.join(WORKING_DIR, file)

        try{
            await fs.promises.mkdir(path.dirname(filePath), { recursive:true })
            await fs.promises.writeFile(filePath, content, 'utf-8')
            return {
                [filePath]: "file created successfully",
            }
        }catch(err){
            return {
                [filePath]: `Error creating file: ${err.message}`
            }
        }
    }))

    res.status(200).json({
        message: 'File creation results',
        results
    })
});

export default app