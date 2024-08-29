using Blazor.Analytics;

using Blazorise;
using Blazorise.Bootstrap5;

using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

using NoiteBurgerSolidario;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddBlazorise(options =>
{
    options.Immediate = true;
}).AddBootstrap5Providers();

builder.Services.AddGoogleAnalytics("G-ZWG2697526");

await builder.Build().RunAsync();
