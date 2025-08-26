// ...existing code...
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using System;

namespace MonacoRazorSelfHosted.Pages
{
    [ApiController]
    [Route("api/json")]
    public class JsonController : ControllerBase
    {
        [HttpPost("save")]
        public IActionResult SaveJson([FromBody] JsonSaveRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Json))
                return BadRequest("No JSON provided");
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/json_data");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
            var filename = req.Filename;
            if (string.IsNullOrWhiteSpace(filename))
                filename = $"json_{Guid.NewGuid().ToString("N")}.json";
            var path = Path.Combine(folder, filename);
            // Ensure .json extension
            if (!filename.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
                path += ".json";
            System.IO.File.WriteAllText(path, req.Json);
            return Ok(new { filename = Path.GetFileName(path) });
        }

        [HttpGet("list")]
        public IActionResult ListJsonFiles()
        {
            var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/json_data");
            if (!Directory.Exists(folder)) return Ok(Array.Empty<string>());
            var files = Directory.GetFiles(folder, "*.json");
            var names = files.Select(f => Path.GetFileName(f)).ToArray();
            return Ok(names);
        }
    }

    public class JsonSaveRequest
    {
        public string Json { get; set; }
        public string Filename { get; set; }
    }
}
// ...existing code...
