using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;

namespace TechTest.Controllers
{
    public class PeopleController : ApiController
    {
        private readonly TechTestDB _db = new TechTestDB();

        // GET: api/People
        public IQueryable<Person> GetPeople()
        {
            return _db.People.Include(p => p.Colours).OrderBy(p => p.FirstName);
        }

        // GET: api/People/5
        [ResponseType(typeof (Person))]
        public IHttpActionResult GetPerson(int id)
        {
            Person person = _db.People.Find(id);
            if (person == null)
            {
                return NotFound();
            }

            return Ok(person);
        }

        // PUT: api/People/5
        [ResponseType(typeof (void))]
        public IHttpActionResult PutPerson(int id, Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != person.PersonId)
            {
                return BadRequest();
            }

            var dbPerson = _db.People.Include(c => c.Colours).Single(p => p.PersonId == person.PersonId);

            // remove colours that are no longer liked
            foreach (var colour in dbPerson.Colours.ToList().Where(colour => !person.ColourIDs.Contains(colour.ColourId)))
            {
                dbPerson.Colours.Remove(colour);
            }

            // add favourite colours
            foreach (var colour in person.ColourIDs.Select(colourId => _db.Colours.Find(colourId)).Where(colour => colour != null))
            {
                dbPerson.Colours.Add(colour);
            }

            _db.Entry(dbPerson).CurrentValues.SetValues(person);

            _db.Entry(dbPerson).State = EntityState.Modified;

            try
            {
                _db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PersonExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/People
        [ResponseType(typeof (Person))]
        public IHttpActionResult PostPerson(Person person)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _db.People.Add(person);
            _db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new {id = person.PersonId}, person);
        }

        // DELETE: api/People/5
        [ResponseType(typeof (Person))]
        public IHttpActionResult DeletePerson(int id)
        {
            Person person = _db.People.Find(id);
            if (person == null)
            {
                return NotFound();
            }

            _db.People.Remove(person);
            _db.SaveChanges();

            return Ok(person);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PersonExists(int id)
        {
            return _db.People.Count(e => e.PersonId == id) > 0;
        }
    }
}