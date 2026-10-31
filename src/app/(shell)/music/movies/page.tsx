import { getAllMovies } from '@/lib/movies'
import { MovieCard } from '@/components/features/movie-card'
import { ScrollArea } from '@/components/ui/scroll-area'

export const metadata = {
    title: 'Movies | Zion Online',
    description: '音楽プラットフォームの動画一覧ページ',
}

export default async function MoviesPage() {
    const movies = await getAllMovies()

    return (
        <ScrollArea className="h-full">
            <div className="p-6 md:p-8 flex-1 space-y-8 pb-32">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Movies</h1>
                        <p className="text-muted-foreground mt-2">
                            おすすめの動画やMVをお楽しみください。
                        </p>
                    </div>
                </div>

                {movies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        現在登録されている動画はありません。
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
