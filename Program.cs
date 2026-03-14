using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);
        builder.Services.AddHttpClient();

        var app = builder.Build();

        app.MapPost("/api/contact", async (ContactRequest request, IHttpClientFactory httpClientFactory, IConfiguration configuration, CancellationToken cancellationToken) =>
        {
            if (string.IsNullOrWhiteSpace(request.Name)
                || string.IsNullOrWhiteSpace(request.Email)
                || string.IsNullOrWhiteSpace(request.Phone)
                || string.IsNullOrWhiteSpace(request.Message))
            {
                return Results.BadRequest(new { message = "Preencha nome, email, telefone e mensagem." });
            }

            if (!request.Email.Contains('@'))
            {
                return Results.BadRequest(new { message = "Informe um email valido." });
            }

            var resendApiKey = configuration["RESEND_API_KEY"];
            var resendFromEmail = configuration["RESEND_FROM_EMAIL"];

            if (string.IsNullOrWhiteSpace(resendApiKey) || string.IsNullOrWhiteSpace(resendFromEmail))
            {
                return Results.Json(
                    new { message = "O envio de email esta indisponivel no momento. Fale conosco pelo WhatsApp (43) 99120-5772." },
                    statusCode: StatusCodes.Status500InternalServerError);
            }

            try
            {
                var client = httpClientFactory.CreateClient();
                client.BaseAddress = new Uri("https://api.resend.com/");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resendApiKey);

                var bodyText = $"""
                    Novo contato pelo site Noite do Burger Solidario

                    Nome: {request.Name}
                    Email: {request.Email}
                    Telefone: {request.Phone}

                    Mensagem:
                    {request.Message}
                    """;

                var bodyHtml = $"""
                    <h2>Novo contato pelo site Noite do Burger Solidario</h2>
                    <p><strong>Nome:</strong> {System.Net.WebUtility.HtmlEncode(request.Name)}</p>
                    <p><strong>Email:</strong> {System.Net.WebUtility.HtmlEncode(request.Email)}</p>
                    <p><strong>Telefone:</strong> {System.Net.WebUtility.HtmlEncode(request.Phone)}</p>
                    <p><strong>Mensagem:</strong></p>
                    <p>{System.Net.WebUtility.HtmlEncode(request.Message).Replace(Environment.NewLine, "<br />").Replace("\n", "<br />")}</p>
                    """;

                var resendRequest = new ResendEmailRequest(
                    resendFromEmail,
                    ["veneravel@arteeciencia.org", "wagenheimer@gmail.com"],
                    $"Novo contato do site: {request.Name}",
                    bodyHtml,
                    bodyText,
                    request.Email);

                using var response = await client.PostAsJsonAsync("emails", resendRequest, cancellationToken);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                    var providerMessage = TryExtractProviderMessage(errorBody);
                    var message = string.IsNullOrWhiteSpace(providerMessage)
                        ? "Nao foi possivel enviar sua mensagem agora. Tente novamente em instantes ou fale conosco no WhatsApp."
                        : $"Nao foi possivel enviar sua mensagem agora. Detalhe: {providerMessage}";

                    return Results.Json(
                        new { message },
                        statusCode: StatusCodes.Status502BadGateway);
                }

                return Results.Ok(new { message = "Mensagem enviada com sucesso. Em breve entraremos em contato." });
            }
            catch (HttpRequestException)
            {
                return Results.Json(
                    new { message = "Nao foi possivel conectar ao servico de email agora. Tente novamente em instantes ou fale conosco no WhatsApp." },
                    statusCode: StatusCodes.Status503ServiceUnavailable);
            }
            catch (TaskCanceledException)
            {
                return Results.Json(
                    new { message = "O envio demorou mais do que o esperado. Tente novamente em instantes." },
                    statusCode: StatusCodes.Status504GatewayTimeout);
            }
            catch (Exception)
            {
                return Results.Json(
                    new { message = "Ocorreu um erro interno ao enviar sua mensagem. Tente novamente em instantes ou fale conosco no WhatsApp." },
                    statusCode: StatusCodes.Status500InternalServerError);
            }
        });

        app.UseDefaultFiles();
        app.UseStaticFiles();

        app.Run();
    }

    private sealed record ContactRequest(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("email")] string Email,
        [property: JsonPropertyName("phone")] string Phone,
        [property: JsonPropertyName("message")] string Message);

    private sealed record ResendEmailRequest(
        [property: JsonPropertyName("from")] string From,
        [property: JsonPropertyName("to")] string[] To,
        [property: JsonPropertyName("subject")] string Subject,
        [property: JsonPropertyName("html")] string Html,
        [property: JsonPropertyName("text")] string Text,
        [property: JsonPropertyName("reply_to")] string ReplyTo);

    private static string? TryExtractProviderMessage(string? responseBody)
    {
        if (string.IsNullOrWhiteSpace(responseBody))
        {
            return null;
        }

        try
        {
            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (root.TryGetProperty("message", out var message) && message.ValueKind == JsonValueKind.String)
            {
                return message.GetString();
            }

            if (root.TryGetProperty("error", out var error))
            {
                if (error.ValueKind == JsonValueKind.String)
                {
                    return error.GetString();
                }

                if (error.ValueKind == JsonValueKind.Object
                    && error.TryGetProperty("message", out var nestedMessage)
                    && nestedMessage.ValueKind == JsonValueKind.String)
                {
                    return nestedMessage.GetString();
                }
            }
        }
        catch (JsonException)
        {
            return responseBody.Trim();
        }

        return responseBody.Trim();
    }
}
