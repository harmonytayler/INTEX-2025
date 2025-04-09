using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace INTEX.API.Data;

[Table("movies_ratings")]
public class MovieRating
{
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("show_id")]
    public string ShowId { get; set; }

    [Column("rating")]
    public int Rating { get; set; }
}