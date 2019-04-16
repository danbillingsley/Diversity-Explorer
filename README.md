# Diversity-Explorer

See this tool now at http://imactivate.com/diversityexplorer/ 

Explore how ethnic diversity varies with age across England and Wales.

This tool uses 2011 census data on ethnic group by sex by age from nomisweb (https://www.nomisweb.co.uk/census/2011/dc2101ew).

# Notes

* The website API uses a MySQL database and PHP.
* These values are estimates.
* Calculations do not take migration into account.
* Scotland and Northern Ireland are not included because their census data is collated separately.

# API Methods

These links show the example JSON output from the API methods used by the website:

Return details of all locations:
http://imactivate.com/diversityexplorer/diversityExplorer_getLocations.php

Return ethnicity data for a particular geography (Leeds local authority in this case):
http://imactivate.com/diversityexplorer/diversityExplorer_getData.php?geographycode=E08000035

# How to run
Download the repository. Download Visual Studio 2019. Open the .sln file. Press Run.

Or if you want to download less and struggle more. The code is written in .NET Core 2.2 -- you can [download the runtime](https://dotnet.microsoft.com/download/dotnet-core/2.2) and run it somehow, probably here. I can't promise that'll be easy though, especially if either of the libraries I've used are not cross-platform.

# The result
This C# tool creates a .csv file of ethnicity data by age for all countries, NUTS1 regions and local authorities in England and Wales. I've included a zipped version. It's called NormalisedAgeGenderEthnicity.csv.
