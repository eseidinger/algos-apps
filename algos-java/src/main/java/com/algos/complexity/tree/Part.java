public class Part extends Conditional {
    private String name;
    private Condition condition;

    public Part(String name, Condition condition) {
        this.name = name;
        this.condition = condition;
    }

    @Override
    public Condition getCondition() {
        return condition;
    }

    @Override
    public String toString() {
        return name;
    }
}