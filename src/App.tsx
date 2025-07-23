import { useEffect, useState } from 'react';
import './App.css';
import { DataTable, type DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';

type Artwork = {
  id: number;
  title: string;
  artist_title: string;
};

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0); // 0-based page index
  const [loading, setLoading] = useState(false);

  // Holds selected artwork IDs
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const pageSize = 10;

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNumber + 1}&limit=${pageSize}`);
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Fetch failed:', error);
    }
    setLoading(false);
  };

  const onPageChange = (event: DataTablePageEvent) => {
    setPage(event.page ?? 0);
  };

  const isRowSelected = (row: Artwork) => selectedIds.has(row.id);

  const toggleRowSelection = (row: Artwork) => {
    const updated = new Set(selectedIds);
    if (updated.has(row.id)) {
      updated.delete(row.id);
    } else {
      updated.add(row.id);
    }
    setSelectedIds(updated);
  };

  const header = (
    <div className="flex align-items-center justify-content-between">
      <h2>Artwork Data Table</h2>
      <span className="font-medium">Selected Artworks: {selectedIds.size}</span>
    </div>
  );

  return (
    <div className="p-4">
      <DataTable
        value={artworks}
        paginator
        rows={pageSize}
        totalRecords={totalRecords}
        first={page * pageSize}
        lazy
        loading={loading}
        onPage={onPageChange}
        header={header}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: '3em' }}
          body={(rowData) => (
            <Checkbox
              checked={isRowSelected(rowData)}
              onChange={() => toggleRowSelection(rowData)}
            />
          )}
        />
        <Column field="id" header="ID" sortable />
        <Column field="title" header="Title" sortable />
        <Column field="artist_title" header="Artist" sortable />
      </DataTable>

      <div className="mt-4">
        <h3>Selected Artworks:</h3>
        {Array.from(selectedIds).map((id) => {
          const artwork = artworks.find((a) => a.id === id);
          return (
            <div key={id}>
              {id} - {artwork?.title ?? 'Title not loaded'} - {artwork?.artist_title ?? 'Artist not loaded'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
