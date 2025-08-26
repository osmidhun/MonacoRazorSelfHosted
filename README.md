
# MonacoRazorSelfHosted (Razor Pages, .NET 8)

Self-hosted Monaco **Diff Editor** for **JSON**, no CDN required (assets via **LibMan**).

## Prereqs
- .NET 8 SDK
- LibMan CLI (install once): `dotnet tool update -g Microsoft.Web.LibraryManager.Cli`

## Restore Monaco assets
```
libman restore
```

## Run
```
dotnet run
```
Then open the URL printed to the console (e.g., https://localhost:7231).

## Files to note
- `Pages/_Layout.cshtml` — includes local Monaco loader and `wwwroot/js/diff.js`
- `wwwroot/js/diff.js` — configures DiffEditor and sample JSON
- `libman.json` — brings `monaco-editor` into `wwwroot/lib/monaco-editor`
