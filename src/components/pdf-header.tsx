export function PdfHeader({ id }: { id: string }) {
  return (
    <div id={id} className="p-4 bg-white text-black">
      <div className="text-center text-sm font-semibold">
        <p>République Algérienne Démocratique et Populaire</p>
        <p>Ministère de l'Éducation Nationale</p>
      </div>
    </div>
  );
}

    