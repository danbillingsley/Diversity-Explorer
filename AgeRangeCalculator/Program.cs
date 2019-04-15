using CsvHelper;
using System;
using System.Collections.Generic;
using System.IO;

namespace AgeRangeCalculator
{
    class Program
    {
        static void Main(string[] args)
        {
            List<AgeEthnicityGender> ageEthnicityGenders = new List<AgeEthnicityGender>();

            processFile("DC2012EW_countries.csv", "Country");
            processFile("DC2012EW_regions.csv", "Region");
            processFile("DC2012EW_localAuthorities.csv", "Local Authority");
            
            void processFile(string filename, string geographyType) {
                string path = Path.Combine(Directory.GetCurrentDirectory(), filename);

                // load the census file
                List<string> Lines = new List<string>(File.ReadAllLines(path));
                
                for (int i = 1; i < Lines.Count; i++)
                {
                    string[] firstLine = Lines[0].Split(',');
                    string[] splitLine = Lines[i].Split(',');

                    for (int x = 3; x < firstLine.Length; x++)
                    {
                        AgeEthnicityGender ageEthnicityGender = new AgeEthnicityGender();
                        ageEthnicityGender.Year = int.Parse(splitLine[0].Replace("\"", ""));
                        ageEthnicityGender.Geography = splitLine[1].Replace("\"", "");
                        ageEthnicityGender.GeographyCode = splitLine[2].Replace("\"", "");
                        ageEthnicityGender.GeographyType = geographyType;

                        string header = firstLine[x].Replace("\"", "");
                        string[] splitHeader = header.Split(";");
                        ageEthnicityGender.Sex = splitHeader[0].Replace("Sex: ", "").Trim();
                        string ageString = splitHeader[1].Replace("Age: ", "").Trim();
                        ageEthnicityGender.Age = ageString;

                        //
                        List<int> ageBoundaries = findAgeBoundaries(ageString);
                        if (ageBoundaries.Count == 2)
                        {
                            ageEthnicityGender.LowerAgeBoundary = ageBoundaries[0];
                            ageEthnicityGender.UpperAgeBoundary = ageBoundaries[1];
                        }
                        
                        ageEthnicityGender.Ethnicity = splitHeader[2].Replace("Ethnic Group: ", "").Trim();
                        ageEthnicityGender.Count = int.Parse(splitLine[x]);

                        ageEthnicityGenders.Add(ageEthnicityGender);
                    }
                }
            }

            // Take the age string and filter to find age boundariess 
            List<int> findAgeBoundaries(string ageField)
            {
                string[] words = ageField.Split(' ');
                List<int> numbers = new List<int>();

                foreach (var word in words)
                {
                    bool isNumber = int.TryParse(word, out int n);
                    if (isNumber == true)
                    {
                        numbers.Add(n);
                    }
                }

                // Only 1 age is mentioned, set the two boundaries to the same age
                if (numbers.Count == 1)
                {
                    numbers.Add(numbers[0]);
                }

                return numbers;
            }                
            
            // write the file
            using (TextWriter writer = new StreamWriter(@"NormalisedAgeGenderEthnicity.csv", false, System.Text.Encoding.UTF8))
            {
                var csv = new CsvWriter(writer);
                csv.WriteRecords(ageEthnicityGenders);
                Console.WriteLine("This should be finished now");
            }
        } 
    }

    public class AgeEthnicityGender
    {
        public int Year { get; set; }
        public string Geography { get; set; }
        public string GeographyCode { get; set; }
        public string GeographyType { get; set; }
        public string Sex { get; set; }
        public string Age { get; set; }
        public int LowerAgeBoundary { get; set; }
        public int UpperAgeBoundary { get; set; }
        public string Ethnicity { get; set; }
        public int Count { get; set; }
    }
}
