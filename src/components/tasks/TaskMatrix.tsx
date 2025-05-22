import { Task, TaskCategory } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface TaskMatrixProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
}

const TaskMatrix = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: TaskMatrixProps) => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;

  const quadrants = [
    {
      id: TaskCategory.UrgentImportant,
      title: isArabic ? "عاجل ومهم" : "Urgent & Important",
      color: "bg-priority-urgent",
      description: isArabic ? "اتخاذ إجراء فوري" : "Do immediately",
      tasks: tasks.filter(task => task.category === TaskCategory.UrgentImportant)
    },
    {
      id: TaskCategory.UrgentNotImportant,
      title: isArabic ? "عاجل وغير مهم" : "Urgent & Not Important",
      color: "bg-priority-high",
      description: isArabic ? "تفويض إن أمكن" : "Delegate if possible",
      tasks: tasks.filter(task => task.category === TaskCategory.UrgentNotImportant)
    },
    {
      id: TaskCategory.NotUrgentImportant,
      title: isArabic ? "غير عاجل ومهم" : "Not Urgent & Important",
      color: "bg-priority-medium",
      description: isArabic ? "جدولة وتخطيط" : "Schedule and plan",
      tasks: tasks.filter(task => task.category === TaskCategory.NotUrgentImportant)
    },
    {
      id: TaskCategory.NotUrgentNotImportant,
      title: isArabic ? "غير عاجل وغير مهم" : "Not Urgent & Not Important",
      color: "bg-priority-low",
      description: isArabic ? "تأجيل أو حذف" : "Eliminate or postpone",
      tasks: tasks.filter(task => task.category === TaskCategory.NotUrgentNotImportant)
    }
  ];

  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.UrgentImportant: return "bg-priority-urgent";
      case TaskCategory.UrgentNotImportant: return "bg-priority-high";
      case TaskCategory.NotUrgentImportant: return "bg-priority-medium";
      case TaskCategory.NotUrgentNotImportant: return "bg-priority-low";
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceQuadrant = result.source.droppableId as TaskCategory;
    const destinationQuadrant = result.destination.droppableId as TaskCategory;
    const taskId = result.draggableId;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update task category and priority color
    onTaskUpdate({
      ...task,
      category: destinationQuadrant,
      priorityColor: getCategoryColor(destinationQuadrant),
      updatedAt: new Date()
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <Card key={quadrant.id} className="overflow-hidden">
            <div className={`p-2 text-white ${quadrant.color}`}>
              <h3 className="font-medium text-center">{quadrant.title}</h3>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground text-center mb-3">{quadrant.description}</p>
              
              <Droppable droppableId={quadrant.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[100px]"
                  >
                    {quadrant.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {quadrant.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border rounded-lg p-2 text-sm"
                              >
                                <p className="font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground">{task.description}</p>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-20 text-muted-foreground">
                        <p className="text-sm">{isArabic ? "لا توجد مهام" : "No tasks"}</p>
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskMatrix;
