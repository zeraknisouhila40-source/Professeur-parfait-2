export function PdfHeader({ id }: { id: string }) {
  return (
    <div id={id} className="p-4 bg-white text-black">
      <div className="text-center text-sm font-semibold">
        <p>Algerian Democratic and People's Republic</p>
        <p>Ministry of National Education</p>
      </div>
    </div>
  );
}
