# syntax=docker/dockerfile:1.0

FROM mcr.microsoft.com/dotnet/sdk:6.0-node AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

WORKDIR /app/DotNet

RUN dotnet restore

RUN dotnet publish --no-restore --configuration Release --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:6.0

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 80

ENTRYPOINT ["dotnet", "FelixMayerInfo.dll"]
