FROM node:22-alpine3.20 AS build-node

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-dot-net

WORKDIR /app

COPY --from=build-node /app/. .

WORKDIR /app/DotNet

RUN dotnet restore

RUN dotnet publish --no-restore --configuration Release --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0

WORKDIR /app

COPY --from=build-dot-net /app/publish .

EXPOSE 80

ENTRYPOINT ["dotnet", "FelixMayerInfo.dll"]
