export default async function Events() {
  const response = await fetch("https://delta-backend.intern.dev.nav.no/event", {next: {revalidate: 0}});

  const events = await response.json();
  
  return (
    <div>
      {events.map((event) => (
        <div>{event.title}</div>
      ))}
    </div>
  );
}
