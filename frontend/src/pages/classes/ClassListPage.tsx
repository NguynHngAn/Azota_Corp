import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Users,
  BookOpen,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { useClassesList } from "@/hooks/queries/classes";

const ClassesPage = () => {
  const { data: classes = [], isLoading, error } = useClassesList();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Classes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your classes and student groups.
            </p>
          </div>
          <Button className="gap-1.5 rounded-lg">
            <Plus className="w-4 h-4" /> New Class
          </Button>
        </div>

        {/* Search */}
        <div className="search-input max-w-sm">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="Search classes..."
            className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground text-sm"
          />
        </div>

        {error ? (
          <div className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load classes"}
          </div>
        ) : null}

        {/* Class cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="glass-card p-5 animate-pulse h-[168px]"
                />
              ))
            : classes.map((cls) => (
            <div
              key={cls.id}
              className="glass-card p-5 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {cls.description || "No description"}
                    </p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Invite: {cls.invite_code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    ID: {cls.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Created {new Date(cls.created_at).toLocaleDateString()}
                </div>
                <span className="text-xs text-muted-foreground">
                  Owner #{cls.created_by}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassesPage;
