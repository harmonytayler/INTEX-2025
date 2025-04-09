using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data;

[Keyless]
[Table("content_recommendations")]
public class ContentRecommendation
{
    [Key]
    [Column("SourceShowID")]
    public string SourceShowID { get; set; }

    [Column("Recommendation1")]
    public string Recommendation1 { get; set; }

    [Column("Recommendation2")]
    public string Recommendation2 { get; set; }

    [Column("Recommendation3")]
    public string Recommendation3 { get; set; }

    [Column("Recommendation4")]
    public string Recommendation4 { get; set; }

    [Column("Recommendation5")]
    public string Recommendation5 { get; set; }

    [Column("Recommendation6")]
    public string Recommendation6 { get; set; }

    [Column("Recommendation7")]
    public string Recommendation7 { get; set; }

    [Column("Recommendation8")]
    public string Recommendation8 { get; set; }

    [Column("Recommendation9")]
    public string Recommendation9 { get; set; }

    [Column("Recommendation10")]
    public string Recommendation10 { get; set; }
}