export type FileExtension = ".json" | ".geojson" | ".png" | ".jpg" | ".jpeg" | ".xlsx" | ".zip" | ".glb" | ".obj" | ".gif" | ".pdf"
export class FileTool {
    static checkFileIsAccept = (file: File, fileExtensions: FileExtension[]) => {
    let result = true
    if (fileExtensions.length > 0) {
        let parts = file.name.split('.');
        let extension = "." + (parts[parts.length - 1] || "")
        //let extension = "." + (file.name.split('.')?.[1]||"")
        result = fileExtensions.includes(extension.toLocaleLowerCase() as FileExtension)
    }
    return result
}
}