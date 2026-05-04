import { useState } from "react"
import { Tag, Plus, Trash2, Car } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

export default function TagManager({tags, onAddTag, onRemoveTag}){
    const [showForm, setShowForm] = useState(false)
    const [newTagId, setNewTagId] = useState("")
    const [newTagName, setNewTagName] = useState("")

    const handleSubmit = () => {
        const success = onAddTag(newTagId, newTagName)
        if(success){
            setNewTagId("")
            setNewTagName("")
        }
    }

    return(
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Tag className="h-5 w-5 text-accent" />
                            Gerenciar Tags
                        </CardTitle>
                        <CardDescription>Cadastrar e remover TAG IDs</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="border-accent/50 text-accent hover:bg-accent/10 cursor-pointer">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Formulário de Novos Usuários Autorizados */}
                {showForm && (
                    <div className="mb-4 space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
                        <Input
                            placeholder="TAG ID (ex: A1B2C3D4)"
                            value={newTagId}
                            onChange={(e) => setNewTagId(e.target.value)}
                            className="font-mono"
                        />
                        <Input
                            placeholder="Nome do Usuário"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!newTagId.trim() || !newTagName.trim()}
                            className="w-full bg-accent text-background hover:bg-accent/90 cursor-pointer"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Cadastrar Tag
                        </Button>
                    </div>
                )}

                {/* Lista de Usuários Autorizados */}
                <div className="max-h-50 space-y-2 overflow-y-auto">
                    {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:bg-secondary/50">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{tag.name}</span>
                                <span className="font-mono text-xs text-primary">{tag.id}</span>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onRemoveTag(tag.id)}
                                className="h-8 w-8 text-muted-foreground hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}