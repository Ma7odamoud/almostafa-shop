# syntax=docker/dockerfile:1
# ASP.NET Core API — multi-stage build, runs as the non-root "app" user on port 8080.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Restore first (cached until a project file changes).
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/AlMostafa.Domain/AlMostafa.Domain.csproj src/AlMostafa.Domain/
COPY src/AlMostafa.Application/AlMostafa.Application.csproj src/AlMostafa.Application/
COPY src/AlMostafa.Infrastructure/AlMostafa.Infrastructure.csproj src/AlMostafa.Infrastructure/
COPY src/AlMostafa.API/AlMostafa.API.csproj src/AlMostafa.API/
RUN dotnet restore src/AlMostafa.API/AlMostafa.API.csproj
COPY src/ src/
# The OpenAPI document is generated in development builds; not needed in the image.
RUN dotnet publish src/AlMostafa.API/AlMostafa.API.csproj -c Release -o /app --no-restore \
      -p:OpenApiGenerateDocuments=false -p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_NOLOGO=1 \
    Storage__UploadsPath=/app/data/uploads \
    Storage__OriginalsPath=/app/data/originals
COPY --from=build /app .
# Photos (web sizes) and private originals live on volumes mounted here; writable by the non-root user.
RUN mkdir -p /app/data/uploads /app/data/originals && chown -R $APP_UID /app/data
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "AlMostafa.API.dll"]
