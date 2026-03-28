import { Trash2 } from 'lucide-react';
import { useStore, InfiniteNode } from '@/store/useStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import EditableTitle from '@/components/ui/editable-title';
import { Textarea } from '@/components/ui/textarea';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const NodeInspector = () => {
  const { nodes, selectedNodeId, updateNode, deleteNode, setSelectedNodeId } = useStore();
  const selectedNode = nodes.find((node: InfiniteNode) => node.id === selectedNodeId) ?? null;

  if (!selectedNode) return null;

  return (
    <Sheet open={!!selectedNode} onOpenChange={(open) => { if (!open) setSelectedNodeId(null); }}>
      <SheetContent side="right" className="apple-glass w-[400px] p-6">
        <div className="space-y-6 mt-8">
          <EditableTitle
            value={selectedNode.title}
            onSave={(value) => updateNode(selectedNode.id, { title: value })}
            className="text-2xl font-bold"
          />

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase opacity-40">Customization</h4>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-6 w-6 rounded-full border-2 transition-colors ${selectedNode.color === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => updateNode(selectedNode.id, { color })}
                />
              ))}
            </div>

            <Textarea
              placeholder="Detailed notes or description..."
              value={selectedNode.notes ?? ''}
              onChange={(event) => updateNode(selectedNode.id, { notes: event.target.value })}
              className="bg-secondary/30 border-none rounded-2xl p-4"
            />
          </div>

          <div className="pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                deleteNode(selectedNode.id);
                setSelectedNodeId(null);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 px-4 py-4 text-red-500 transition-all hover:bg-red-500 hover:text-white font-bold"
            >
              <Trash2 size={16} />
              Delete Section
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NodeInspector;
