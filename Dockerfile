# syntax=docker/dockerfile:1.0
FROM mcr.microsoft.com/dotnet/aspnet:6.0

EXPOSE 80

COPY DotNet/bin/Release/net6.0/publish/ App/

WORKDIR /App
ENTRYPOINT ["dotnet", "FelixMayerInfo.dll"]
