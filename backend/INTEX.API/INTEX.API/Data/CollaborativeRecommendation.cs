using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace INTEX.API.Data;

[Keyless]
[Table("collaborative_recommendations")]
public class CollaborativeRecommendation
{
    [Key]
    [Column("show_id")]
    public string ShowId { get; set; }

    [Column("rec_1")]
    public string Rec1 { get; set; }

    [Column("rec_2")]
    public string Rec2 { get; set; }

    [Column("rec_3")]
    public string Rec3 { get; set; }

    [Column("rec_4")]
    public string Rec4 { get; set; }

    [Column("rec_5")]
    public string Rec5 { get; set; }

    [Column("rec_6")]
    public string Rec6 { get; set; }

    [Column("rec_7")]
    public string Rec7 { get; set; }

    [Column("rec_8")]
    public string Rec8 { get; set; }

    [Column("rec_9")]
    public string Rec9 { get; set; }

    [Column("rec_10")]
    public string Rec10 { get; set; }
}