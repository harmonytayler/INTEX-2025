using INTEX.API.Data;
using Microsoft.AspNetCore.Mvc;

namespace INTEX.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class TestController: ControllerBase
    {
        private TestDbContext _testContext;
        public TestController(TestDbContext temp) => _testContext = temp;

        [HttpGet("AllTestItems")]
        public IActionResult GetItems()
        {
            var query = _testContext.TestItems.AsQueryable();
            var testItems = query.ToList();

            return Ok(testItems);
        }
    }
}