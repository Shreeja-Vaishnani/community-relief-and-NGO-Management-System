const colors = {
  pending:'bg-yellow-100 text-yellow-800', approved:'bg-blue-100 text-blue-800',
  fulfilled:'bg-green-100 text-green-800', rejected:'bg-red-100 text-red-800',
  received:'bg-blue-100 text-blue-800', distributed:'bg-green-100 text-green-800',
  open:'bg-gray-100 text-gray-800', assigned:'bg-purple-100 text-purple-800',
  in_progress:'bg-orange-100 text-orange-800', completed:'bg-green-100 text-green-800',
  cancelled:'bg-red-100 text-red-800', critical:'bg-red-100 text-red-800',
  high:'bg-orange-100 text-orange-800', medium:'bg-yellow-100 text-yellow-800',
  low:'bg-green-100 text-green-800',
};

export default function StatusBadge({ value }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colors[value] || 'bg-gray-100'}`}>
      {value?.replace('_',' ')}
    </span>
  );
}
