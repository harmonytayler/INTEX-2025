using System.ComponentModel.DataAnnotations;

namespace INTEX.API.Data
{
    public class TestItem
    {
        [Key]
        public int TestItemId { get; set; }
        [Required]
        public required string TestItemName { get; set; }
    }
}