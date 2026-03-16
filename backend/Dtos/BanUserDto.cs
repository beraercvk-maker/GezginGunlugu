using System;

namespace backend.Dtos
{
    
    public class BanUserDto
    {
        


        public DateTimeOffset? LockoutEndDate { get; set; }
    }
}