import { MapPin, Coffee, Utensils, Hamburger } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-5" />
            <span className="font-semibold tracking-tight">
              თბილისის კვების გიდი
            </span>
          </div>
          <Button variant="outline" size="sm" disabled>
            შესვლა
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="flex flex-col items-start gap-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            იპოვე საუკეთესო კვების ობიექტი თბილისში
          </h1>
          <p className="max-w-2xl text-balance text-muted-foreground">
            ინტერაქტიული რუკა ტურისტებისთვის — ფილტრე უბნებისა და კატეგორიების
            მიხედვით, წაიკითხე ადგილობრივების კომენტარები.
          </p>
          <div className="flex gap-3">
            <Button disabled>რუკის ნახვა</Button>
            <Button variant="outline" disabled>
              უბნების სია
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            🚧 პროექტი მუშავდება — T1.2 (scaffold) დასრულდა
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Utensils className="size-5" />
              <CardTitle>რესტორნები</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ქართული, ევროპული და ეთნიკური სამზარეულო თბილისის ყველა უბანში.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Coffee className="size-5" />
              <CardTitle>კაფეები</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              სპეციალური ყავა, საუზმე, brunch და სამუშაო სივრცეები.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Hamburger className="size-5" />
              <CardTitle>სწრაფი კვება</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              ხინკალი, ხაჭაპური, ბურგერი — სწრაფი ვარიანტები გზაში.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-xs text-muted-foreground">
          © 2026 თბილისის კვების გიდი · ღია წყაროების Google Places API
        </div>
      </footer>
    </div>
  );
}
