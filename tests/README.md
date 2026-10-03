# Portable source regressions

Run with .NET 10.0.401 and C# 5:

```sh
dotnet run --project tests/Portable.Tests/Portable.Tests.csproj --configuration Release
```

Links the actual PlaceItem and HtmlRemoval sources with an inert MVVM notification adapter. Covers null/empty descriptions, tag removal, short text, exactly 255 characters and truncation at 256. No backend, database, authentication, PayPal or external provider is used.

These tests do not build or validate the historical application SDK/device runtime. Original platform targets, dependencies and vendor binaries are unchanged. The .NET harness has no package feeds or external test packages.
