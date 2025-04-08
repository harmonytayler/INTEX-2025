using System;

namespace INTEX.API.Helpers
{
    public static class FuzzySearchHelper
    {
        public static bool FuzzyMatch(string source, string target)
        {
            if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target))
                return false;

            source = source.ToLower();
            target = target.ToLower();

            // If the strings are identical after normalization, return true
            if (source == target)
                return true;

            // If the target is contained within the source, return true
            if (source.Contains(target))
                return true;

            // Calculate Levenshtein distance
            int distance = LevenshteinDistance(source, target);
            return distance <= 2; // Fixed max distance of 2
        }

        private static int LevenshteinDistance(string source, string target)
        {
            int[,] distance = new int[source.Length + 1, target.Length + 1];

            for (int i = 0; i <= source.Length; i++)
                distance[i, 0] = i;

            for (int j = 0; j <= target.Length; j++)
                distance[0, j] = j;

            for (int i = 1; i <= source.Length; i++)
            {
                for (int j = 1; j <= target.Length; j++)
                {
                    int cost = (target[j - 1] == source[i - 1]) ? 0 : 1;

                    distance[i, j] = Math.Min(Math.Min(
                        distance[i - 1, j] + 1,      // deletion
                        distance[i, j - 1] + 1),     // insertion
                        distance[i - 1, j - 1] + cost); // substitution
                }
            }

            return distance[source.Length, target.Length];
        }
    }
} 