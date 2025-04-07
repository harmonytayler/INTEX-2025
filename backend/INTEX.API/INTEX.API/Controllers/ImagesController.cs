using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly BlobContainerClient _containerClient;

    public ImagesController(IConfiguration config)
    {
        var connectionString = config["AzureBlobStorage:ConnectionString"];
        var containerName = config["AzureBlobStorage:ContainerName"];
        _containerClient = new BlobContainerClient(connectionString, containerName);
    }

    [HttpGet("{filename}")]
    public IActionResult GetImageUrl(string filename)
    {
        var blobClient = _containerClient.GetBlobClient(filename);
        if (!blobClient.Exists())
            return NotFound();

        var uri = blobClient.Uri.ToString(); // Direct URL
        return Ok(uri);
    }
}
